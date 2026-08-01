# Checkout incidents

Tags: technical, checkout, 502, outage, incident, payment gateway

A 502 from checkout means the payment gateway rejected or dropped the request.
No order is created, so there is nothing to refund -- say so explicitly, because
customers frequently assume they have been charged.

## Handling order


1. Check whether an incident is already open for the payment gateway.
2. If several customers report it inside an hour, treat it as an incident rather
   than an individual ticket and escalate immediately.
3. Enterprise-tier reports skip the queue.

## Do not advise retrying

Never advise the customer to retry payment repeatedly. Retries against a failing
gateway can create authorisation holds that look exactly like duplicate charges,
which turns one ticket into two.
