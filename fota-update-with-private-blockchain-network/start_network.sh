export CHANNEL_NAME=mychannel
export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export IMAGE_TAG="1.4.2"
export SYS_CHANNEL="sys-channel"

echo "######################################################"
echo "#########  Generate Certificates #####################"
echo "######################################################"
# Generates Org certs using cryptogen tool
cryptogen generate --config=./crypto-config.yaml

echo "######################################################"
echo "#########  Generate Genesis Block ####################"
echo "######################################################"
# Generating Orderer Genesis block
configtxgen -profile TwoOrgsOrdererGenesis -channelID $SYS_CHANNEL -outputBlock ./channel-artifacts/genesis.block

echo "######################################################"
echo "#########  Generate Channel Transaction ##############"
echo "######################################################"
# Generating channel configuration transaction '${CHANNEL_NAME}.tx'
configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME

echo "######################################################"
echo "#########  Generate Anchor Peer Update Profile #######"
echo "######################################################"
# Generating anchor peer update for Org1MSP
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
# Generating anchor peer update for Org2MSP
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP

echo "######################################################"
echo "#########  Replace Private Key #######################"
echo "######################################################"
export CA1_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org1.example.com/ca && ls *_sk)
export CA2_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org2.example.com/ca && ls *_sk)

echo "######################################################"
echo "#########  Starting The Network ######################"
echo "######################################################"
docker-compose -f docker-compose-cli.yaml -f docker-compose-couch.yaml -f docker-compose-ca.yaml up -d
docker ps -a

#////////////////////////////////////////////////////////////////////////#

echo "######################################################"
echo "#########  Down Running Network ######################"
echo "######################################################"
docker-compose -f docker-compose-cli.yaml -f docker-compose-couch.yaml -f docker-compose-ca.yaml down --volumes --remove-orphans
rm -rf channel-artifacts/*.block channel-artifacts/*.tx crypto-config ./org3-artifacts/crypto-config/ channel-artifacts/org3.json
docker rm $(docker ps -aq)  
docker rmi $(docker images dev-* -q)


#////////////////////////////////////////////////////////////////////////#
export CHANNEL_NAME=mychannel
export PATH=${PWD}/../bin:${PWD}:$PATH
export FABRIC_CFG_PATH=${PWD}
export ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export IMAGE_TAG="1.4.2"
export SYS_CHANNEL="sys-channel"
cryptogen generate --config=./crypto-config.yaml
configtxgen -profile TwoOrgsOrdererGenesis -channelID $SYS_CHANNEL -outputBlock ./channel-artifacts/genesis.block
configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/${CHANNEL_NAME}.tx -channelID $CHANNEL_NAME
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP
export CA1_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org1.example.com/ca && ls *_sk)
export CA2_PRIVATE_KEY=$(cd crypto-config/peerOrganizations/org2.example.com/ca && ls *_sk)
docker-compose -f docker-compose-cli.yaml -f docker-compose-couch.yaml -f docker-compose-ca.yaml up -d
docker ps -a
