export type SkinPresetPropertyType =
    'color' // color picker
    | 'number' // number input
    | 'size' // css size field (px, em, rem, % etc.)
    | 'string' // text input
    | 'boolean' // checkbox
    | 'percent' // percentage slider/input
    | 'percent:0-1' // 0-1 slider/input
    | 'option' // single option of list
    | 'options'
    | 'shadow'; // multiple options of list

export type SkinPresetConfig = {
    skin: string;
    name: string;
    version: string;

    common: { [key: string]: string | number | boolean };

    [key: string]: string | number | { [key: string]: string | number | boolean };
};

export type SkinPresetSchemaProperty = {
    type: SkinPresetPropertyType;
    value: string | number | boolean | string[] | number[];
    list?: string[] | number[];
}

export type SkinPresetSchema = {
    skin: string,
    name: string,
    version: string

    values: {
        common: { [key: string]: SkinPresetSchemaProperty };

        [key: string]: { [key: string]: SkinPresetSchemaProperty };
    }
}

class SkinPreset<S extends SkinPresetSchema = SkinPresetSchema> {
    schema: S;

    constructor(schema: S,
                config?: SkinPresetConfig) {
        this.schema = schema;

        if (config) {
            this.applyConfig(config);
        }
    }

    makeConfig(): SkinPresetConfig | any {
        const config: {
            common: { [key: string]: string | number | boolean },

            [key: string]: string | number | { [key: string]: string | number | boolean }
        } = {
            common: {},
        };

        Object.entries(this.schema.values)
            .forEach(([sectionKey, sectionProperties]) => {
                Object.entries(sectionProperties)
                    .forEach(([propertyKey, property]) => {
                        if (config[sectionKey] == undefined) {
                            config[sectionKey] = {};
                        }

                        // @ts-ignore
                        config[sectionKey][propertyKey] = property.value;
                    });
            });

        return {
            skin: this.schema.skin,
            name: this.schema.name,
            version: this.schema.version,

            ...config,
        };
    }

    makeReadyToUseConfig(): SkinPresetConfig | any {
        const newConfig = this.makeConfig();

        Object.entries(newConfig)
            .forEach(([sectionKey, sectionProperties]) => {
                if (typeof sectionProperties !== "object") {
                    return;
                }

                if (sectionKey === "common") {
                    return;
                }

                const mapValue = (key: string, value: string | number | boolean): string | number | boolean => {
                    if (typeof value === "boolean" || typeof value === "number") {
                        return value;
                    } else {
                        if (value === "default") {
                            if (key in newConfig.common) {
                                value = newConfig.common[key];
                            }
                        }

                        // @ts-ignore
                        if (value.substring(0, 1) === "$") {
                            // @ts-ignore
                            if (value.substring(1) in newConfig.common) {
                                // @ts-ignore
                                value = newConfig.common[value.substring(1)];
                            }
                        }

                        return value;
                    }
                };

                Object.entries(sectionProperties as { [key: string]: SkinPresetPropertyType })
                    .forEach(([propertyKey, property]) => {
                        // @ts-ignore
                        sectionProperties[propertyKey] = mapValue(propertyKey, property);
                    });
            });

        return newConfig;
    }

    applyConfig(config: SkinPresetConfig): this {
        if (config.skin) {
            this.schema.skin = config.skin;
        }

        if (config.name) {
            this.schema.name = config.name;
        }

        if (config.version) {
            this.schema.version = config.version;
        }

        // todo: handle different versions
        // todo: handle different name/skin (throw an error)

        Object.entries(config)
            .forEach(([sectionKey, sectionProperties]) => {
                if (typeof sectionProperties !== "object") {
                    return;
                }

                Object.entries(sectionProperties)
                    .forEach(([propertyKey, property]) => {
                        this.schema.values[sectionKey][propertyKey].value = property;
                    });
            });

        return this;
    }
}

export function applyPreset(preset: SkinPreset): void {
    const config = preset.makeReadyToUseConfig();

    const $root = document.querySelector(":root") as HTMLElement;

    if ($root) {
        Object.entries(config.common)
            .forEach(([k, v]) => {
                $root.style.setProperty(`--modern-${k}`, String(v));
            });

        Object.entries(config)
            .forEach(([sectionKey, sectionProperties]) => {
                if (typeof sectionProperties !== "object") {
                    return;
                }

                if (sectionKey === "common") {
                    return;
                }

                Object.entries(sectionProperties as { [key: string]: SkinPresetPropertyType })
                    .forEach(([propertyKey, propertyValue]) => {
                        $root.style.setProperty(`--modern-${sectionKey}-${propertyKey}`, String(propertyValue));
                    });
            });
    }
}

export default SkinPreset;
