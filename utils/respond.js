/**
 * Safely respond after an interaction has been deferred.
 *
 * Fixes DiscordAPIError[10008] "Unknown Message" that can happen when
 * editing the original reply (e.g., if it was deleted or no longer exists).
 */

async function safeEdit(interaction, payload) {
  try {
    return await interaction.editReply(payload);
  } catch (e) {
    if (e && (e.code === 10008 || e.status === 404)) {
      return interaction.followUp(payload).catch(() => {});
    }
    throw e;
  }
}

module.exports = { safeEdit };
