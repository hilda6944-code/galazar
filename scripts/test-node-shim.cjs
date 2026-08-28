// tsx derives a temporary path from os.userInfo() on Windows. Some constrained
// test hosts fail that lookup with ENOMEM; a stable test-only uid avoids it.
if (process.platform === 'win32' && typeof process.geteuid !== 'function') {
  process.geteuid = () => 1000;
}
