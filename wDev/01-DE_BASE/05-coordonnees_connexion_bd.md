# Session pooler | Shared Pooler (RECOMMANDER POUR UN FICHIER .bat et pour le .env)
*_  Only recommended as an alternative to Direct Connection, when connecting via an IPv4 network._*

  postgresql://postgres.wimxjmhmqqfhbmlpyymd:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:5432/postgres
  host:
    aws-0-eu-west-2.pooler.supabase.com
  port:
    5432
  database:
    postgres
  user:
    postgres.wimxjmhmqqfhbmlpyymd
  pool_mode:
    session
  
  mdp : 6_Te@mExplora


# -------------------------------------

# Transaction pooler | Shared Pooler
*_   Ideal for stateless applications like serverless functions where each interaction with Postgres is brief and isolated.*

  postgresql://postgres.wimxjmhmqqfhbmlpyymd:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
  host:
    aws-0-eu-west-2.pooler.supabase.com
  port:
    6543
  database:
    postgres
  user:
    postgres.wimxjmhmqqfhbmlpyymd
  pool_mode:
    transaction

# -------------------------------------
# Direct connection
*_    Ideal for applications with persistent, long-lived connections, such as those running on virtual machines or long-standing containers.*

  postgresql://postgres:[YOUR-PASSWORD]@db.wimxjmhmqqfhbmlpyymd.supabase.co:5432/postgres
  host:
    db.wimxjmhmqqfhbmlpyymd.supabase.co
  port:
    5432
  database:
    postgres
  user:
    postgres




