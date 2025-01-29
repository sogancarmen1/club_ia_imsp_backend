CREATE SCHEMA articles;

SET search_path TO pg_catalog,public,articles;

CREATE TABLE articles.informations (
	id serial NOT NULL,
	title varchar NOT NULL,
	contain text NOT NULL,
	date_publication date NOT NULL,
	date_update date NOT NULL,
	CONSTRAINT articles_pk PRIMARY KEY (id)
);

CREATE TABLE articles.medias (
	id serial NOT NULL,
	url varchar NOT NULL,
	type varchar NOT NULL,
	original_name varchar NOT NULL,
	files_names varchar NOT NULL,
	size integer NOT NULL,
	id_informations integer,
	CONSTRAINT medias_pk PRIMARY KEY (id)
);

ALTER TABLE articles.medias ADD CONSTRAINT informations_fk FOREIGN KEY (id_informations)
REFERENCES articles.informations (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE public.subscriber (
	id serial NOT NULL,
	email varchar NOT NULL,
	date_inscription date NOT NULL,
	password varchar,
	CONSTRAINT subscriber_pk PRIMARY KEY (id)
);


