# Spelling Bee Assistant

This is a stripped-down version of the original repository for the [Spelling Bee Assistant](https://github.com/draber/draber.github.io). All code that isn't directly related to the Firefox extension has been removed.

## What does the extension do?
Visit the [project's homepage](https://spelling-bee-assistant.app/). You can test-wise use the bookmarklet on that page to get a better idea. 

## How do I build the extension?
You can create two different IIFE bundles, a compressed and an uncompressed version of the same code base. The extension is set up to use the compressed version, the uncompressed one is just there for readability.

```
// Clone the repository
git clone draber/spelling-bee-ff-extension

// install node modules
npm i

// Bundle the ES 6 modules into an IIFE
npm run dev

// Bundle the ES 6 modules into a compressed IIFE
npm run build
```
Zip the resulting code in (dist/extension) and rename the file extension to _.crx_.

## Why is the version number so high?
The project went through multiple iterations, from a simple IIFE bookmarklet to the ES 6 module based approach it has now. There were releases of most steps along the way. The version number therefore refers to the whole project, not just the Firefox extension.

- [Source code](https://github.com/draber/spelling-bee-ff-extension/tree/main/src/js)
- [License](https://github.com/draber/spelling-bee-ff-extension/blob/main/LICENSE.md)
