# Assets

Icons, images, fonts and other assets of `link-foundation/ui`.

Every file here needs exactly one record in [`assets.lino`](assets.lino); the
format and the licence policy are in [`docs/licensing.md`](../docs/licensing.md).
Our own assets are public domain (CC0-1.0); third-party assets record their
source, copyright, licence and attribution.

[`ATTRIBUTIONS.md`](ATTRIBUTIONS.md) is generated from the records by
`npm run assets:attributions`, and `REUSE.toml` by
`node scripts/check-assets.mjs --write`. `npm run check:assets` verifies both
the records and `REUSE.toml`.
