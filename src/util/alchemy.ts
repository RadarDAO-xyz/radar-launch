import { Alchemy, Network } from 'alchemy-sdk';
import { ethers } from 'ethers';

process.env.ALCHEMY_KEY = 'SfD9OfK6DQ79QHzPZW_0RWQaLFs7qGXv';
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