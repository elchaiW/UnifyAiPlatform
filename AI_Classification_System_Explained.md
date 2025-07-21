# AI Classification System - How It Works

## Overview
The Multi-AI platform uses an intelligent classification system to automatically route requests to the most appropriate AI model based on content analysis.

## Classification Process

### Step 1: Content Analysis
When you submit a prompt or document, the system analyzes the content using keyword detection to determine the category.

### Step 2: Keyword Scoring
The system searches for specific keywords in each category:

#### Marketing Keywords (Routes to Gemini)
- marketing, brand, campaign, social media, strategy
- gen z, millennials, consumer, fashion, influencer
- positioning, launch, sustainable, business development

#### Legal Keywords (Routes to Claude) 
- contract, legal, compliance, regulatory, terms
- agreement, policy, law, regulation

#### Coding Keywords (Routes to Grok)
- code, debug, function, javascript, python
- programming, syntax, error, development

#### General Keywords (Routes to ChatGPT)
- If no specific category keywords are found, defaults to ChatGPT

### Step 3: AI Model Selection
Based on keyword score, the system routes to:

1. **Gemini** - Marketing content (highest marketing keyword score)
2. **Claude** - Legal content (highest legal keyword score)  
3. **Grok** - Technical/coding content (highest coding keyword score)
4. **ChatGPT** - General content (fallback for everything else)

### Step 4: Confidence Calculation
Confidence = 0.5 + (keyword_count × 0.1), capped at 0.9

## Current System Status
Due to OpenAI quota limits, the system is using a fallback keyword-based classification instead of OpenAI's advanced classification. This ensures all AI models remain accessible for testing.

## Example Classifications

### Marketing Example:
**Input:** "Create a digital marketing strategy for launching a new AI-powered fitness app targeting Gen Z and millennials"

**Keywords Found:** marketing, strategy, gen z, millennials, targeting, launching (6 keywords)
**Category:** marketing
**Selected Model:** gemini
**Confidence:** 90% (0.5 + 6×0.1 = 1.1, capped at 0.9)

### Legal Example:
**Input:** "Review this employment contract for compliance issues"

**Keywords Found:** contract, compliance (2 keywords)
**Category:** legal  
**Selected Model:** claude
**Confidence:** 70% (0.5 + 2×0.1 = 0.7)

### Coding Example:
**Input:** "Debug this Python function that has a syntax error"

**Keywords Found:** debug, python, function, syntax, error (5 keywords)
**Category:** coding
**Selected Model:** grok
**Confidence:** 90% (0.5 + 5×0.1 = 1.0, capped at 0.9)