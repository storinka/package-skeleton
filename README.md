# Skin Preset

Storinka skin preset module.

## Installation

```shell
yarn add @storinka/skin-preset
```

## Usage

```js
import SkinPreset, { applyPreset } from "@storinka/skin-preset";

const presetSchema = {
    skin: 'modern',
    name: 'default',
    version: '0.0.1',

    common: {
        bgColor: {
            type: 'color',
            value: 'white',
        },
        borderRadius: {
            type: 'size',
            value: '10px',
        },
    },
    card: {
        bgColor: {
            type: 'color',
            value: 'default', // will use bgColor from common
        },
        borderRadius: {
            type: 'size',
            value: '$borderRadius', // will use borderRadius from common
        },
    }
};

const darkConfig = {
    skin: 'modern',
    name: 'dark',
    version: '0.0.1',
    
    common: {
        bgColor: 'black',
        borderRadius: '20px',
    },
    card: {
        bgColor: 'default',
        borderRadius: 'default',
    },
};

const preset = new new SkinPreset(
    presetSchema,
);

// apply default preset
applyPreset(preset);

const darkPreset = new new SkinPreset(
    presetSchema,
    darkConfig,
);

// apply dark preset
applyPreset(darkPreset);
```
