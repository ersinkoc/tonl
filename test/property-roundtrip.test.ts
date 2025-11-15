/**
 * Property-based tests for JSON <-> TONL roundtrips using fast-check
 */

import { test, describe } from "node:test";
import assert from "node:assert";
import fc from "fast-check";
import { encodeTONL, decodeTONL, encodeSmart } from "../dist/index.js";

// Generate a safe subset of JSON values that are known to roundtrip in TONL:
// - primitives (null, boolean, finite numbers, safe strings)
// - flat objects with safe keys and primitive values
// - arrays of primitives (no nested arrays or objects)
const safeString = fc
    .string({ minLength: 1, maxLength: 64 })
    .filter((s) => /^[A-Za-z0-9 _.\-]*$/.test(s))
    .filter((s) => !/^\s|\s$/.test(s)) // no leading/trailing spaces
    .filter((s) => !/^-?(?:\d+|\d*\.\d+)(?:e[+-]?\d+)?$/i.test(s)); // avoid numeric-looking strings (including .5, -.5)

const primitiveArb = fc.oneof(
    fc.constant(null),
    fc.boolean(),
    fc.double({ noNaN: true, noDefaultInfinity: true, min: -1e12, max: 1e12 }),
    safeString
);

const forbiddenKeys = new Set([
    "__proto__",
    "constructor",
    "prototype",
    "toString",
    "valueOf",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "__defineGetter__",
    "__defineSetter__",
    "__lookupGetter__",
    "__lookupSetter__"
]);

const safeKey = fc
    .string({ minLength: 1, maxLength: 24 })
    .filter((k) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(k) && !k.startsWith("@") && !forbiddenKeys.has(k));

const objectOfPrimitives = fc.dictionary(safeKey, primitiveArb);
const arrayOfPrimitives = fc.array(primitiveArb, { maxLength: 64 });
const safeJson = fc.oneof(primitiveArb, objectOfPrimitives, arrayOfPrimitives);

// Moderately complex JSON: nested objects and arrays with safe keys and strings,
// arrays of objects, and mixed arrays (objects + primitives). Excludes empty objects.
const quotedSafeKey = fc
    .string({ minLength: 1, maxLength: 32 })
    .filter((k) =>
        // allow characters that force quoting but avoid reserved/bad ones
        !forbiddenKeys.has(k) &&
        !k.startsWith("@") &&
        k.trim().length > 0 &&
        // explicitly allow special chars likely to need quoting
        /^[^\n\r\t]+$/.test(k)
    );

const specialString = fc
    .string({ minLength: 1, maxLength: 80 })
    // include punctuation, quotes, braces, delimiters, and newlines
    .filter((s) => !/^\s|\s$/.test(s)) // still avoid leading/trailing spaces to keep this stable
    .filter((s) => !/^-?(?:\d+|\d*\.\d+)(?:e[+-]?\d+)?$/i.test(s)); // avoid numeric-looking

const primitiveOrSpecial = fc.oneof(
    primitiveArb,
    specialString
);

const moderateComplexJson = fc.letrec((tie) => ({
    primitive: primitiveOrSpecial,
    obj: fc.oneof(
        fc.dictionary(safeKey, tie("primitive")),
        fc.dictionary(quotedSafeKey, tie("primitive"))
    ).filter((o) => Object.keys(o).length > 0),
    arrayPrim: fc.array(tie("primitive"), { maxLength: 12 }),
    arrayObj: fc.array(fc.dictionary(safeKey, tie("primitive")).filter((o) => Object.keys(o).length > 0), { maxLength: 8 }),
    mixedArray: fc.array(fc.oneof(tie("primitive"), tie("obj")), { maxLength: 8 }),
    nested: fc.oneof(
        tie("obj"),
        tie("arrayPrim"),
        tie("arrayObj"),
        tie("mixedArray")
    )
})).nested;

describe("property-based: json <-> tonl roundtrip", () => {
    test("roundtrips any JSON value with default options", async () => {
        await fc.assert(
            fc.property(safeJson, (value) => {
                const tonl = encodeTONL(value);
                const back = decodeTONL(tonl);
                assert.deepStrictEqual(back, value);
            }),
            { verbose: true, numRuns: 150 }
        );
    });

    test("roundtrips any JSON value across delimiters", async () => {
        const delimiterArb = fc.constantFrom(",", "|", ";", "\t");
        await fc.assert(
            fc.property(safeJson, delimiterArb, (value, delimiter) => {
                const tonl = encodeTONL(value, {
                    delimiter,
                    includeTypes: false,
                    prettyDelimiters: false,
                    singleLinePrimitiveLists: true,
                    indent: 2
                });
                const back = decodeTONL(tonl);
                assert.deepStrictEqual(back, value);
            }),
            { verbose: true, numRuns: 150 }
        );
    });

    test("roundtrips any JSON value with encodeSmart", async () => {
        await fc.assert(
            fc.property(safeJson, (value) => {
                const tonl = encodeSmart(value);
                const back = decodeTONL(tonl);
                assert.deepStrictEqual(back, value);
            }),
            { verbose: true, numRuns: 150 }
        );
    });

    test(process.env.TONL_FUZZ_AGGRESSIVE ? "AGGRESSIVE fuzz (opt-in): moderate complexity across delimiters" : "skip AGGRESSIVE fuzz (set TONL_FUZZ_AGGRESSIVE=1 to enable)", async (t) => {
        if (!process.env.TONL_FUZZ_AGGRESSIVE) {
            t.skip();
            return;
        }
        const delimiterArb = fc.constantFrom(",", "|", ";", "\t");
        await fc.assert(
            fc.property(moderateComplexJson, delimiterArb, (value, delimiter) => {
                const tonl = encodeTONL(value, {
                    delimiter,
                    includeTypes: fc.sample(fc.boolean(), 1)[0],
                    prettyDelimiters: false,
                    singleLinePrimitiveLists: true,
                    indent: 2
                });
                const back = decodeTONL(tonl);
                assert.deepStrictEqual(back, value);
            }),
            { verbose: true, numRuns: 200 }
        );
    });
});


