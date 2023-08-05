import { ethers } from 'ethers';
import { Router } from 'express';
import { HydratedDocument } from 'mongoose';
import Project, { IProject } from '../models/Project';
import { retrieveVideoThumbnail } from '../util/regex';
import { chainId, contractAddress, abi } from '../util/web3';

const MetadataRouter = Router();

MetadataRouter.get('/:tokenId', async (req, res) => {
    const tokenId = req.params.tokenId;
    if (tokenId === undefined) {
        return res.status(404).end();
    }
    const provider = ethers.getDefaultProvider(chainId);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const [_status, _fee, _balance, _owner, id] =
        (await contract.editions(tokenId)) ?? [];

    if (!id) {
        return res.status(404).end();
    }
    const project = (await Project.findById(id)) as HydratedDocument<IProject>;
    if (!project) {
        return res.status(404).end();
    }
    res.json({
        name: project.title,
        image: retrieveVideoThumbnail(project.video_url),
        description: project.description,
        external_url: `https://radarlaunch.app/projects/${project._id}`
    }).end();
});

export default MetadataRouter;
