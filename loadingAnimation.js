const animation = ["/", "-", "\\", "|"];

function processing() {
  let i = 0;
  setInterval(() => {
    if (i > 3) i = 0;
    process.stdout.write(
      `\x1b[0J\x1b[1000DProcessing(\x1b[1m${animation[i]}\x1b[0m.)`
    );
    i++;
  }, 100);
}

module.exports = processing;
