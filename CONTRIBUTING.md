# Contributing to OpenChoreo Case Studies

Thank you for your interest in contributing! 🎉 This repository thrives on community contributions — whether it is a small example project or a full end-to-end case study built with OpenChoreo.

## 📋 Table of Contents

- [Types of Contributions](#types-of-contributions)
- [Contribution Guidelines](#contribution-guidelines)
- [Project Structure](#project-structure)
- [Submitting a Contribution](#submitting-a-contribution)
- [Code of Conduct](#code-of-conduct)

## 🧩 Types of Contributions

### 1. Example Projects (`examples/`)
Small, focused projects that demonstrate a specific OpenChoreo feature or pattern.

- Should be self-contained and easy to run
- Should target a single concept or feature
- Should include a clear `README.md`

### 2. Case Studies (`case-studies/`)
End-to-end real-world scenarios that showcase how OpenChoreo solves a practical problem.

- Should represent a realistic use case
- Should document the problem, solution, and architecture decisions
- Should include a `README.md` with a full walkthrough

## ✅ Contribution Guidelines

- Each contribution must live in its own folder under `examples/` or `case-studies/`
- Every project folder **must** include a `README.md` with:
  - Project name and description
  - Prerequisites
  - Setup and usage instructions
  - Architecture overview (for case studies)
- Code should be clean, well-commented, and follow best practices
- Avoid including sensitive credentials or environment-specific configurations
- Use `.env.example` files instead of committing real `.env` files

## 🗂️ Project Structure

Each project folder should follow this structure:

```
examples/my-example/
├── README.md           # Project description and instructions
├── .env.example        # Example environment variables (no real secrets)
├── src/                # Source code
└── ...                 # Any other relevant files
```

## 🚀 Submitting a Contribution

1. **Fork** this repository
2. **Create a new branch** for your contribution:
   ```bash
   git checkout -b add/my-example-project
   ```
3. **Add your project** under the appropriate directory (`examples/` or `case-studies/`)
4. **Ensure your project has a `README.md`** with clear instructions
5. **Open a Pull Request** against the `main` branch with:
   - A clear title (e.g., `Add: REST API example using OpenChoreo`)
   - A description of what your project demonstrates
   - Any relevant links or references

## 🧑‍💻 Code of Conduct

Please be respectful and constructive in all interactions. We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

Thank you for helping make OpenChoreo more accessible to everyone! 🚀