(function () {
  const defaultConfig = {
    provider: "gemini",
    geminiApiKey: "",
    geminiModel: "gemini-2.0-flash",
    mistralApiKey: "",
    mistralModel: "mistral-small-latest",
    mistralFallbackModels: ["mistral-small-latest"]
  };

  function getConfig() {
    return { ...defaultConfig, ...(window.ARTHSAATHI_CONFIG || {}) };
  }

  function buildPromptPayload({
    loanContext,
    userQuery,
    conversationHistory,
    adaptationInstruction,
    calculationContext
  }) {
    const historyText = conversationHistory.length > 1
      ? conversationHistory
          .slice(-6) // last 3 turns only, keeps context fresh
          .map((entry) => `${entry.role === "assistant" ? "ArthSaathi" : "User"}: ${entry.content}`)
          .join("\n")
      : null;

    const sections = [
      "╔══════════════════════════════════════════╗",
      "║         USER'S COMPLETE LOAN BRIEF       ║",
      "╚══════════════════════════════════════════╝",
      "",
      loanContext,
      "",
      calculationContext,
      ""
    ];

    if (historyText) {
      sections.push(
        "=== RECENT CONVERSATION (for context) ===",
        historyText,
        ""
      );
    }

    if (adaptationInstruction) {
      sections.push(
        "=== HOW TO RESPOND THIS TIME ===",
        adaptationInstruction,
        ""
      );
    }

    sections.push(
      "=== USER'S QUESTION ===",
      userQuery,
      "",
      "Remember: Answer in Hinglish, use ONLY the numbers from the Loan Brief above, keep it under 200 words."
    );

    return sections.join("\n");
  }

  async function callGemini({
    systemPrompt,
    loanContext,
    userQuery,
    conversationHistory,
    adaptationInstruction,
    calculationContext
  }) {
    const config = getConfig();
    if (!config.geminiApiKey) {
      throw new Error("Gemini API key missing in config.js");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${encodeURIComponent(config.geminiApiKey)}`;
    const prompt = buildPromptPayload({
      loanContext,
      userQuery,
      conversationHistory,
      adaptationInstruction,
      calculationContext
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 700
        }
      })
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Gemini request failed: ${response.status} ${details}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const text = parts.map((part) => part.text || "").join("").trim();
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }
    return text;
  }

  function normalizeMistralContent(content) {
    if (typeof content === "string") {
      return content;
    }
    if (Array.isArray(content)) {
      return content
        .map((item) => {
          if (typeof item === "string") return item;
          if (item?.text) return item.text;
          if (item?.type === "text" && item?.text) return item.text;
          return "";
        })
        .join("")
        .trim();
    }
    return "";
  }

  function isMistralCapacityError(status, details) {
    return status === 429 && details.includes("service_tier_capacity_exceeded");
  }

  async function requestMistralChat({ apiKey, model, systemPrompt, prompt }) {
    return fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 700,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
      })
    });
  }

  async function callMistral({
    systemPrompt,
    loanContext,
    userQuery,
    conversationHistory,
    adaptationInstruction,
    calculationContext
  }) {
    const config = getConfig();
    if (!config.mistralApiKey) {
      throw new Error("Mistral API key missing in config.js");
    }

    const prompt = buildPromptPayload({
      loanContext,
      userQuery,
      conversationHistory,
      adaptationInstruction,
      calculationContext
    });

    const fallbackModels = Array.isArray(config.mistralFallbackModels)
      ? config.mistralFallbackModels
      : [];
    const modelsToTry = [config.mistralModel, ...fallbackModels].filter(Boolean);
    const uniqueModelsToTry = [...new Set(modelsToTry)];
    let lastError = null;

    for (const model of uniqueModelsToTry) {
      const response = await requestMistralChat({
        apiKey: config.mistralApiKey,
        model,
        systemPrompt,
        prompt
      });

      if (!response.ok) {
        const details = await response.text();
        if (isMistralCapacityError(response.status, details) && model !== uniqueModelsToTry[uniqueModelsToTry.length - 1]) {
          lastError = `Mistral model ${model} is busy right now, trying fallback model.`;
          continue;
        }
        throw new Error(`Mistral request failed on model ${model}: ${response.status} ${details}`);
      }

      const data = await response.json();
      const content = normalizeMistralContent(data.choices?.[0]?.message?.content);
      if (content) {
        return content;
      }
      lastError = `Mistral returned an empty response on model ${model}.`;
    }

    throw new Error(lastError || "Mistral returned an empty response.");
  }

  async function generateResponse(payload) {
    const config = getConfig();
    if (config.provider === "mistral") {
      return callMistral(payload);
    }
    return callGemini(payload);
  }

  window.generateResponse = generateResponse;
})();