#!/bin/bash
set -e

echo "=== Building Nuxt (Build Output API for Vercel) ==="
npx nuxi build

echo "=== Done ==="

# Note: build output goes to .vercel/output (Build Output API) for Vercel git auto-deploy.
# No post-processing — full Vue hydration is preserved so the contact form,
# chat widget, language toggle and age gate all work on the homepage.
