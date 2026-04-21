from dotenv import load_dotenv
load_dotenv()

from langchain_core.prompts import ChatPromptTemplate
from langchain_mistralai import ChatMistralAI

model = ChatMistralAI(model='mistral-small-2506')

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

i = input("Enter a movie description: ")

# Convert prompt → messages
messages = prompt.format_messages(input_text=i)

# Send messages to model
response = model.invoke(messages)

print(response.content)