const prTitle = process.env.PR_TITLE; // env value will be set by github workflow

if (!prTitle || !/^[A-Z].+/.test(prTitle)) {
  console.error('Invalid PR title. It must start with an uppercase letter.');
  process.exit(1);
}

if (!prTitle || prTitle.length < 15 || prTitle.length > 150) {
  console.error(
    'Invalid PR title. It should be minimum 15 and maximum 150 characters.',
  );
  process.exit(1);
}

console.log('PR title is valid.');
