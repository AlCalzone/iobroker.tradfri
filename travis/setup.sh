#!/bin/bash

if [ "$TRAVIS_OS_NAME" == "linux" ]; then
  # for linux builds, download and install the neccessary packages
  sudo apt-get install -y python-software-properties
  sudo add-apt-repository -y ppa:ubuntu-toolchain-r/test
  sudo apt-get update
  sudo apt-get install -y gcc-4.8
  sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.8 50
  sudo apt-get install -y g++-4.8
  sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.8 50
else
  # TODO: figure out what's neccessary for osx
  echo "THIS IS SPARTA!"
fi
