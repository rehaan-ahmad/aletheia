# Contributing to Aletheia

Thank you for your interest in improving Aletheia! Since this was primarily built as a fast-paced hackathon project, we highly encourage issue creation and discussion before attempting major feature pull requests.

## How to Contribute
1. Fork the repo and create your branch from `main`.
2. Ensure you have installed the `pre-commit` configuration (run `pre-commit install`) so that `gitleaks` actively scans our secrets.
3. If you've modified our Next.js UI or logic, run `npm run build` and `npm run lint` thoroughly.
4. If you've modified the Python API, run `pip-audit` to ensure libraries remain uncompromised.
5. Create a descriptive PR outlining the intent of the code changes, ensuring backward compatibility.

## Code Style
- **Frontend**: Follow Next.js `eslint` guidelines and keep Tailwind UI standard component architecture patterns. 
- **Backend**: Use `typing` strict rules in FastAPI along with `Pydantic` mapping structures for any JSON I/O validation handling.
