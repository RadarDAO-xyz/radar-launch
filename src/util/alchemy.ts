import { Alchemy, Network } from 'alchemy-sdk';
import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';
import { optimism } from 'viem/chains';

// Optional config object, but defaults to the API key 'demo' and Network 'eth-mainnet'.
const settings = {
    apiKey: process.env.ALCHEMY_KEY, // Replace with your Alchemy API key.
    network: Network.OPT_MAINNET // Replace with your network.
};

export const AlchemyAPI = new Alchemy(settings);

export const ProjectContractAddress =
    '0xdbed288027cCbE7F6746bB62c989E7C09C7c8059';
const abi = [
    {
        stateMutability: 'view',
        type: 'function',
        inputs: [],
        name: 'getEditions',
        outputs: [
            {
                name: '',
                internalType: 'struct EditionsStructs.Edition[]',
                type: 'tuple[]',
                components: [
                    {
                        name: 'status',
                        internalType: 'enum EditionsStructs.EditionStatus',
                        type: 'uint8'
                    },
                    { name: 'fee', internalType: 'uint256', type: 'uint256' },
                    {
                        name: 'balance',
                        internalType: 'uint256',
                        type: 'uint256'
                    },
                    { name: 'owner', internalType: 'address', type: 'address' },
                    { name: 'id', internalType: 'string', type: 'string' }
                ]
            }
        ]
    }
];

const provider = new ethers.AlchemyProvider(
    'optimism',
    process.env.ALCHEMY_KEY
);
const contract = new ethers.Contract(ProjectContractAddress, abi, provider);

export type Edition = {
    tokenId: string;
    status: bigint;
    fee: bigint;
    balance: bigint;
    owner: string;
    id: string;
};

export async function getEditions(): Promise<Edition[]> {
    const editions = await contract.getEditions();
    return editions.map((v: unknown[], i: number) => ({
        tokenId: i.toString(),
        status: v[0] as bigint,
        fee: v[1] as bigint,
        balance: v[2] as bigint,
        owner: v[3] as string,
        id: v[4] as string
    }));
}

const publicClient = createPublicClient({ chain: optimism, transport: http() });

export async function getLogs(editionId: number) {
    return publicClient.getLogs({
        address: ProjectContractAddress,
        args: {
            editionId: BigInt(editionId)
        },
        event: {
            anonymous: false,
            inputs: [
                {
                    indexed: true,
                    internalType: 'uint256',
                    name: 'editionId',
                    type: 'uint256'
                },
                {
                    indexed: true,
                    internalType: 'address',
                    name: 'believer',
                    type: 'address'
                },
                {
                    indexed: false,
                    internalType: 'string',
                    name: 'tags',
                    type: 'string'
                }
            ],
            name: 'EditionBelieved',
            type: 'event'
        },
        fromBlock: 108947105n
    });
}
