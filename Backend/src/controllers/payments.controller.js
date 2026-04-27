const PaymentChannel = require("../models/PaymentChannel");

async function getSettlements(req, res, next) {
  try {
    const channels = await PaymentChannel.find({
      businessId: req.user.businessId,
    }).lean();
    res.json(channels);
  } catch (err) {
    next(err);
  }
}

async function getChannels(req, res, next) {
  try {
    const channels = await PaymentChannel.find({
      businessId: req.user.businessId,
      isEnabled: true,
    }).lean();
    res.json(channels);
  } catch (err) {
    next(err);
  }
}

async function settle(req, res, next) {
  try {
    const channel = await PaymentChannel.findOneAndUpdate(
      { _id: req.body.channelId, businessId: req.user.businessId },
      { $set: { settleStatus: "Settled", settledAt: new Date() } },
      { new: true },
    );
    if (!channel) return res.status(404).json({ error: "Channel not found" });
    res.json(channel);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettlements, getChannels, settle };
