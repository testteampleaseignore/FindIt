--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6 (Ubuntu 10.6-0ubuntu0.18.04.1)
-- Dumped by pg_dump version 10.6 (Ubuntu 10.6-0ubuntu0.18.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: round_placements; Type: TABLE; Schema: public; Owner: brian
--

CREATE TABLE public.round_placements (
    placement_number integer,
    user_id integer NOT NULL,
    round_id integer NOT NULL
);


ALTER TABLE public.round_placements OWNER TO brian;

--
-- Name: rounds; Type: TABLE; Schema: public; Owner: brian
--

CREATE TABLE public.rounds (
    id integer NOT NULL,
    starter_id integer,
    datetime_started timestamp without time zone,
    target_url character varying(510),
    target_latitude numeric,
    target_longitude numeric
);


ALTER TABLE public.rounds OWNER TO brian;

--
-- Name: rounds_id_seq; Type: SEQUENCE; Schema: public; Owner: brian
--

CREATE SEQUENCE public.rounds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rounds_id_seq OWNER TO brian;

--
-- Name: rounds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: brian
--

ALTER SEQUENCE public.rounds_id_seq OWNED BY public.rounds.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: brian
--

CREATE TABLE public.users (
    id integer NOT NULL,
    user_name character varying(50) NOT NULL,
    password_hash character varying(510),
    email character varying(100),
    points integer,
    attempts integer
);


ALTER TABLE public.users OWNER TO brian;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: brian
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO brian;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: brian
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: rounds id; Type: DEFAULT; Schema: public; Owner: brian
--

ALTER TABLE ONLY public.rounds ALTER COLUMN id SET DEFAULT nextval('public.rounds_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: brian
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: round_placements; Type: TABLE DATA; Schema: public; Owner: brian
--

COPY public.round_placements (placement_number, user_id, round_id) FROM stdin;
1	2	1
1	1	2
1	2	3
\.


--
-- Data for Name: rounds; Type: TABLE DATA; Schema: public; Owner: brian
--

COPY public.rounds (id, starter_id, datetime_started, target_url, target_latitude, target_longitude) FROM stdin;
1	1	2019-03-21 14:58:00	\N	\N	\N
2	2	2019-03-21 15:05:50	\N	\N	\N
3	1	2019-03-21 15:07:18	\N	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: brian
--

COPY public.users (id, user_name, password_hash, email, points, attempts) FROM stdin;
1	brian	$2b$10$lYzhcmu0uJZN9VMY3fy6y.dz/FzFKmpzWRjMlUDvzUWLiWDQ0zSya	b@g.com	\N	\N
2	nick	$2b$10$lYzhcmu0uJZN9VMY3fy6y.dz/FzFKmpzWRjMlUDvzUWLiWDQ0zSya	n@g.com	\N	\N
3   marlo    $2b$10$lYzhcmu0uJZN9VMY3fy6y.dz/FzFKmpzWRjMlUDvzUWLiWDQ0zSya    m@g.com \N  \N
\.


--
-- Name: rounds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: brian
--

SELECT pg_catalog.setval('public.rounds_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: brian
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: round_placements round_placements_pkey; Type: CONSTRAINT; Schema: public; Owner: brian
--

ALTER TABLE ONLY public.round_placements
    ADD CONSTRAINT round_placements_pkey PRIMARY KEY (round_id, user_id);


--
-- Name: rounds rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: brian
--

ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_pkey PRIMARY KEY (id);


--
-- Name: users uq_user_info; Type: CONSTRAINT; Schema: public; Owner: brian
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_user_info UNIQUE (user_name, email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: brian
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_user_name_key; Type: CONSTRAINT; Schema: public; Owner: brian
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_name_key UNIQUE (user_name);


--
-- Name: round_placements round_placements_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brian
--

ALTER TABLE ONLY public.round_placements
    ADD CONSTRAINT round_placements_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.rounds(id);


--
-- Name: round_placements round_placements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brian
--

ALTER TABLE ONLY public.round_placements
    ADD CONSTRAINT round_placements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: rounds rounds_starter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brian
--

ALTER TABLE ONLY public.rounds
    ADD CONSTRAINT rounds_starter_id_fkey FOREIGN KEY (starter_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

