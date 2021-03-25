create database side_stacker;

create table players (
    id varchar(255) not null,
    name varchar(255) not null,
    primary key (id)
);

create table rooms (
    id varchar(255) not null,
    playerIdOne varchar(255) not null,
    playerIdTwo varchar(255) not null,
    status varchar(255) not null,
    winner varchar(255),
    primary key (id)
);

create table moves (
    id serial not null,
    roomId varchar(255) not null,
    move int not null,
    playerId varchar(255) not null,
    piece varchar(255) not null,
    primary key (id)
);