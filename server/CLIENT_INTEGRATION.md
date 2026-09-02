# Client integration contract

The UI remains untouched in this phase. Use `POST /sessions` to select a scenario, then parse/confirm intent, fetch catalog, run selection and evaluation, resolve a review, issue a permit, and create an order. All money fields are paise. A permit binds the exact cart rather than a maximum amount. Receipt signatures are HMAC-SHA256 and are tamper-evident, not immutable.
