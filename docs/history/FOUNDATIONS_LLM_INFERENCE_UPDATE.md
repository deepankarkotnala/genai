# Foundations of LLMs — inference-loop precision update

## What changed

- Updated Section 2 to distinguish full-prompt **prefill** from cached token-by-token **decode**.
- Redrew Figure 1 so the sampled **Token ID** feeds back to the Transformer/model input rather than to the Tokenizer.
- Added a visible **KV cache** component and read/update path to the architecture diagram.
- Added a production-optimization callout explaining:
  - tokenizer bypass inside the autoregressive model-input loop;
  - incremental detokenization for user-facing streaming;
  - prefill versus decode;
  - KV-cache reuse and memory growth;
  - the caveat that speculative decoding may process or validate multiple tokens in a step.
- Tightened the relevant interview/recall answers to use the same precise mental model.

## Technical conclusion

The reported issue was valid. Looping the sampled output through the tokenizer is a useful high-level abstraction, but it is not the normal production inference data path. The sampled integer token ID is supplied directly as the next model input, while cached attention keys and values avoid recomputation of earlier positions.
