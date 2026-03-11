create table if not exists users (
  id text primary key not null,
  email text not null unique,
  password_hash text not null,
  display_name text,
  created_at integer not null,
  updated_at integer not null
);

create table if not exists sessions (
  id text primary key not null,
  user_id text not null,
  expires_at integer not null,
  created_at integer not null,
  foreign key (user_id) references users(id) on delete cascade
);

create index if not exists sessions_user_id_idx on sessions(user_id);
create index if not exists sessions_expires_at_idx on sessions(expires_at);
