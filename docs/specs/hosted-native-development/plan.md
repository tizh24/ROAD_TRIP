# Hosted Native Development — Technical Plan

Run the active NestJS services through Turbo on the host. A PowerShell launcher
loads an ignored hosted environment file, validates required variables, fixes
the inter-service URLs to loopback addresses, and starts only the active
services. Supabase Cloud and hosted Redis replace the local Docker dependencies.

The launcher deliberately clears a shared `PORT` value so each service uses its
existing default: Gateway 4100, Core 4101, Geo 4102 and Worker 4105.
