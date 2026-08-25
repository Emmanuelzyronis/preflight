# Preflight

**Pre-signature privacy analysis for Starknet transactions.**

Preflight helps users understand what a proposed transaction may reveal **before they sign it**.

Built for the **STRK20 Private Sprint hackathon**, Preflight addresses **IDEA-25 — Transaction privacy simulator**.

> **Preflight is a seatbelt, not a mixer.**

It does not move funds, execute swaps, or provide privacy by itself. It analyzes a proposed transaction and explains potential privacy exposure using public on-chain data and transaction simulation.

## What Preflight Does

Before signing a transaction, Preflight aims to answer:

- **What becomes public?**
  - Addresses
  - Token amounts
  - Contract interactions
  - Gas information
  - Transaction timing

- **What may be linkable?**
  - Funding sources
  - Destination addresses
  - Change addresses
  - Repeated transaction patterns

- **How large is the effective anonymity set?**
  - Recent matching activity
  - Trailing 24-hour activity
  - Trailing 7-day activity

- **What correlation risks exist?**
  - Exact-amount matches
  - Round-number patterns
  - Timing proximity
  - Rapid deposit/withdrawal patterns
  - Repeated-use behavioral fingerprints

- **What changes when using STRK20?**
  - Public transaction exposure
  - STRK20-mediated exposure
  - A side-by-side privacy comparison

## Core Idea

Most privacy failures do not necessarily happen because a privacy protocol is broken.

They can happen because a user unknowingly creates a recognizable pattern around an otherwise private transaction.

Preflight is designed to make those risks visible **before the transaction is signed**.

## Architecture

```text
Dapp / Wallet
      |
      v
Preflight SDK Hook
      |
      v
Preflight API
      |
      +--------------------+
      |                    |
      v                    v
Transaction          Privacy Scoring
Simulation           Engine
      |                    |
      v                    |
Starknet RPC               |
      |                    |
      +---------+----------+
                |
                v
        Privacy Report
                |
                v
          User Interface
