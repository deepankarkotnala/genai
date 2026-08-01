# Duplicate charges

Tags: billing, duplicate, double charge, refund

A duplicate charge is two settled payments for the same order within 24 hours.

## How to confirm one


1. Look up the order and check whether two settlements share the order id.
2. Confirm the amounts match exactly. Different amounts are usually proration,
   not duplication -- see `billing-proration.md`.
3. Check `already_refunded` before proposing anything.

## Handling a confirmed duplicate

Confirmed duplicates are refunded at the duplicate amount, not the order total.
Treat them as high priority regardless of customer tier: the customer has been
overcharged and every hour of delay costs trust.
