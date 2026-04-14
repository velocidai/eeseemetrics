import { http, HttpResponse } from "msw";

/** A valid LlmTextOutput JSON that satisfies the schema in aiReportTypes.ts */
export const mockLlmTextOutput = {
  summary: "Traffic this week was stable with modest growth across all channels.",
  highlights: [
    {
      type: "positive",
      metric: "sessions",
      observation: "Sessions increased 12% compared to the previous week.",
    },
  ],
  recommendations: [
    "Continue publishing content that performed well this week.",
    "Investigate the bounce rate on the homepage.",
  ],
};

export const llmSuccessHandlers = [
  http.post("https://openrouter.ai/api/v1/chat/completions", () => {
    return HttpResponse.json({
      choices: [
        {
          message: {
            role: "assistant",
            content: JSON.stringify(mockLlmTextOutput),
          },
        },
      ],
    });
  }),
];

export const llmErrorHandlers = [
  http.post("https://openrouter.ai/api/v1/chat/completions", () => {
    return HttpResponse.json(
      { error: { message: "Rate limit exceeded", type: "rate_limit_error" } },
      { status: 429 }
    );
  }),
];
