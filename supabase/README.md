# Smart Farming – Supabase Database

## Overview
This folder contains the Supabase PostgreSQL database documentation and SQL migration for the Smart Farming project.

The project architecture is:

**React Frontend → Django Backend → Supabase PostgreSQL**

Django communicates with Supabase to store and retrieve farming data.

## Database Tables

The database contains six tables:

| Table | Purpose |
|---|---|
| `farm_zones` | Stores farm zone information |
| `sensor_readings` | Stores sensor measurements |
| `predictions` | Stores machine-learning prediction results |
| `crop_records` | Stores crop and harvest information |
| `alerts` | Stores farming alerts |
| `irrigation_logs` | Stores irrigation activity |

## Database Migration

The initial database migration is located at:

`supabase/migrations/001_initial_schema.sql`

It defines:
- The six database tables and their columns.
- Primary keys and known constraints.
- Automatically generated identity IDs.
- Row Level Security (RLS) policies.
- Permissions for the Django database role.

## Security

Row Level Security is enabled on all six tables.

The current policies allow the `farmsense_django` role to perform database operations on these tables.

The Django role must exist and have the required PostgreSQL privileges and role membership configured.

## Django Connection

The Django backend connects to the Supabase PostgreSQL database using database connection settings.

**Important:** Database passwords, secret keys and connection strings must be stored securely in environment variables. Do not commit credentials to GitHub.

## Important Notes

- The SQL migration is intended for setting up a fresh database.
- Do not run it against the existing populated database because the tables and policies already exist.
- The migration describes the database structure; it does not contain the existing database records.
- Additional database objects and configuration should be documented as they are verified.
