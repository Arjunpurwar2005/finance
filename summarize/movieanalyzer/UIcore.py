from dotenv import load_dotenv
load_dotenv()

import streamlit as st
from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai import ChatMistralAI
import PyPDF2

# मॉडल (unchanged)
model = ChatMistralAI(model='mistral-small-2506')

# Prompt (unchanged)
prompt = ChatPromptTemplate.from_template("""
You are an expert legal and financial document analyst.

Your task is to analyze the following agreement text and extract critical information in a clear, structured, and easy-to-understand way for a non-expert user.

Text:
{input_text}

Instructions:

1. Provide a Simple Summary (in plain English, 3–5 sentences).

2. Extract Important Clauses:
   - Payment terms
   - Interest rates (fixed/variable)
   - Late payment penalties
   - Cancellation/termination terms
   - Renewal conditions
   - Obligations of the customer

3. Identify Hidden Charges or Fees:
   - Processing fees
   - Prepayment penalties
   - Late fees
   - Any charges not obvious at first glance

4. Highlight Risky or Unfavorable Terms:
   - High penalties
   - One-sided clauses
   - Automatic renewals
   - Clauses limiting user rights
   - Any vague or ambiguous language

5. Key Financial Details:
   - EMI amount
   - Interest rate
   - Loan tenure
   - Total repayment amount (if available)

6. Red Flags (VERY IMPORTANT):
   - List anything that could potentially harm the customer financially or legally.

7. Confidence Note:
   - Mention if any part of the document is unclear or missing context.

Return output in this format:

Simple Summary:
...

Important Clauses:
- ...

Hidden Charges or Fees:
- ...

Risky or Unfavorable Terms:
- ...

Key Financial Details:
- ...

Red Flags:
- ...

Confidence Note:
...
""")

# ---------------- UI ---------------- #

st.set_page_config(page_title="Loan Agreement Analyzer")
st.title("📄 Loan Agreement Analyzer")

# Text input
user_text = st.text_area("Paste Agreement Text")

# PDF Upload
uploaded_file = st.file_uploader("Or upload a PDF", type=["pdf"])

def extract_text_from_pdf(file):
    pdf_reader = PyPDF2.PdfReader(file)
    text = ""
    for page in pdf_reader.pages:
        if page.extract_text():
            text += page.extract_text() + "\n"
    return text

# If PDF uploaded → override text
if uploaded_file is not None:
    user_text = extract_text_from_pdf(uploaded_file)
    st.success("PDF text extracted successfully!")

# Analyze button
if st.button("Analyze Document"):
    if user_text.strip() == "":
        st.warning("Please provide text or upload a PDF.")
    else:
        # Same logic as your CLI version
        messages = prompt.format_messages(input_text=user_text)
        response = model.invoke(messages)

        st.subheader("📊 Analysis Result")
        st.write(response.content)