// src/ipfs.js
import { create } from 'ipfs-http-client';

// ✅ Create IPFS client (using Infura gateway)
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
});

export default ipfs;
