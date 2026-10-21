# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | ✅ Current release |

## Reporting a Vulnerability

If you discover a security vulnerability in **LFAI — Learning From AI**, please **do not** open a public GitHub issue.

Instead, please report it via:

1. **GitHub Security Advisories**: [Report a vulnerability](https://github.com/xixici/learning-from-ai/security/advisories/new) *(preferred)*
2. **Email**: If you cannot use GitHub Security Advisories, email the maintainers directly at `202388990@qq.com`

### What to Include

- A description of the vulnerability and potential impact
- Steps to reproduce or proof-of-concept code
- Affected version(s)
- Any suggested mitigation

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 7 days
- **Fix / patch**: Depends on severity — critical issues within 14 days

### Scope

LFAI is a VS Code extension that:
- Reads your local Git diff and workspace files
- Sends code context to external LLM APIs (only if configured)
- Writes Markdown files to your workspace

**In scope**: API key exposure, data leakage to unexpected third-party endpoints, local file system traversal beyond workspace root.

**Out of scope**: Vulnerabilities in VS Code itself, your LLM provider's API, or Node.js/npm packages (please report those upstream).
