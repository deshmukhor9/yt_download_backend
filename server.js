const express = require("express");
const cors = require("cors");
const ytdlp = require("yt-dlp-exec");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

app.get("/download", async (req, res) => {
  const { url, type } = req.query;
  if (!url) return res.status(400).send("No URL provided");

  const ext = type === "audio" ? "m4a" : "mp4";
  const filename = `ytfile.${ext}`;
  const outputPath = path.join(__dirname, filename);

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", type === "audio" ? "audio/mp4" : "video/mp4");

  try {
    // Use yt-dlp to download to local file
    await ytdlp(url, {
      output: outputPath,
      format: type === "audio" ? "bestaudio[ext=m4a]" : "mp4",
    });

    // Stream the downloaded file
    res.sendFile(outputPath, {}, (err) => {
      fs.unlinkSync(outputPath); // Clean up
      if (err) console.error("Stream error:", err);
    });
  } catch (error) {
    console.error("yt-dlp error:", error);
    res.status(500).send("Failed to download.");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
