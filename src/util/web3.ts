export const abi = [
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        name: 'editions',
        outputs: [
            {
                internalType: 'enum EditionsStructs.EditionStatus',
                name: 'status',
                type: 'uint8'
            },
            {
                internalType: 'uint256',
                name: 'fee',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'balance',
                type: 'uint256'
            },
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            },
            {
                internalType: 'string',
                name: 'id',
                type: 'string'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
export const contractAddress = '0xcb25E9dcF86dB259765bA7a986dF142B41414036';
export const chainId = 10;
