-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 28, 2019 at 04:51 PM
-- Server version: 5.6.38
-- PHP Version: 7.2.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `msgWallDemo`
--

-- --------------------------------------------------------

--
-- Table structure for table `eventLog`
--

CREATE TABLE `eventLog` (
  `eventLogId` int(11) NOT NULL,
  `eventType` varchar(20) NOT NULL,
  `eventSubject` varchar(100) NOT NULL,
  `eventDetails` mediumtext NOT NULL,
  `eventTimestamp` datetime NOT NULL,
  `userId` int(11) NOT NULL,
  `ipAddress` varchar(20) NOT NULL,
  `alertLevel` int(11) NOT NULL,
  `phpSessionId` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `invitationCodes`
--

CREATE TABLE `invitationCodes` (
  `invitationCodeId` int(11) NOT NULL,
  `invitationCode` varchar(50) NOT NULL,
  `codeDesc` tinytext NOT NULL,
  `usesLeft` int(11) NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `msgUser`
--

CREATE TABLE `msgUser` (
  `msgUserId` int(11) NOT NULL,
  `dataType` int(11) NOT NULL,
  `msgId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `createDate` datetime NOT NULL,
  `updateDate` datetime NOT NULL,
  `dataValueInt` int(11) NOT NULL,
  `dataValueStr` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userId` int(11) NOT NULL,
  `emailAdr` varchar(200) NOT NULL,
  `pwdHash` text NOT NULL,
  `firstName` varchar(60) NOT NULL,
  `lastName` varchar(60) NOT NULL,
  `aboutUser` mediumtext NOT NULL,
  `updateDate` datetime NOT NULL,
  `createDate` datetime NOT NULL,
  `lastLogon` datetime NOT NULL,
  `lastPostDate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `userUsers`
--

CREATE TABLE `userUsers` (
  `userUserId` int(11) NOT NULL,
  `dataType` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `actingOnUserId` int(11) NOT NULL,
  `createDate` datetime NOT NULL,
  `updateDate` datetime NOT NULL,
  `dataValueInt` int(11) NOT NULL,
  `dataValueStr` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `wallMessages`
--

CREATE TABLE `wallMessages` (
  `msgId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `userWallId` int(11) NOT NULL,
  `msgTimestamp` datetime NOT NULL,
  `msgContent` text NOT NULL,
  `parentMsgId` int(11) NOT NULL,
  `topLevelMsgId` int(11) NOT NULL,
  `likeCount` int(11) NOT NULL,
  `commentCount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `eventLog`
--
ALTER TABLE `eventLog`
  ADD PRIMARY KEY (`eventLogId`);

--
-- Indexes for table `invitationCodes`
--
ALTER TABLE `invitationCodes`
  ADD PRIMARY KEY (`invitationCodeId`);

--
-- Indexes for table `msgUser`
--
ALTER TABLE `msgUser`
  ADD PRIMARY KEY (`msgUserId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`);

--
-- Indexes for table `userUsers`
--
ALTER TABLE `userUsers`
  ADD PRIMARY KEY (`userUserId`);

--
-- Indexes for table `wallMessages`
--
ALTER TABLE `wallMessages`
  ADD PRIMARY KEY (`msgId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `eventLog`
--
ALTER TABLE `eventLog`
  MODIFY `eventLogId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=209;

--
-- AUTO_INCREMENT for table `invitationCodes`
--
ALTER TABLE `invitationCodes`
  MODIFY `invitationCodeId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `msgUser`
--
ALTER TABLE `msgUser`
  MODIFY `msgUserId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `userUsers`
--
ALTER TABLE `userUsers`
  MODIFY `userUserId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wallMessages`
--
ALTER TABLE `wallMessages`
  MODIFY `msgId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;
