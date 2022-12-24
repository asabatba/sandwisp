import Axios from 'axios';
import chroma from 'chroma-js';
import R from 'ramda';
import sharp from 'sharp';
import { setColorsOf } from '../db/colors';
import { Color, imagePreproc } from './colors_utils';


export async function retrieveAndSaveColors(type: 'album' | 'playlist', id: string, url: string) {

    const colors = await imgPalette(url);
    setColorsOf(type, id, colors);
    return colors;
}

export async function imgPalette(url: string) {

    const response = await Axios.get(url, { responseType: 'arraybuffer' });

    const buffer = await sharp(Buffer.from(response.data, 'binary'))
        .ensureAlpha().resize(32, 32).raw().toBuffer();

    // console.log(buffer.byteLength);
    const arr: Color[] = [];
    for (let i = 0; i < buffer.byteLength - 1; i += 4) {
        arr.push([buffer.readUInt8(i), buffer.readUInt8(i + 1), buffer.readUInt8(i + 2), buffer.readUInt8(i + 3)]);
    }
    return kmeans(arr);
}

function rngColor() {
    return [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
}

const indexOfMinValue = (a: number[]) => a.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);

function rgb2hsv_ko(c: Color) {

    const prima = [c[0] / 255, c[1] / 255, c[2] / 255];
    const cMax = Math.max(...prima);
    const cMin = Math.min(...prima);
    const delta = cMax - cMin;

    let hue;
    if (delta === 0) {
        hue = 0;
    } else if (cMax === prima[0]) {
        hue = 60 * ((prima[1] - prima[2]) / delta + 0);
    } else if (cMax === prima[1]) {
        hue = 60 * ((prima[2] - prima[0]) / delta + 2);
    } else if (cMax === prima[2]) {
        hue = 60 * ((prima[0] - prima[1]) / delta + 4);
    }

    return [
        hue,
        cMax ? delta / cMax : 0,
        cMax
    ];
}

function rgb2hsv(c: Color) {

    const r = c[0], g = c[1], b = c[2];
    let rr: number, gg: number, bb: number, h: number, s: number;
    const rabs = r / 255;
    const gabs = g / 255;
    const babs = b / 255;
    const v = Math.max(rabs, gabs, babs);
    const diff = v - Math.min(rabs, gabs, babs);
    const diffc = (c: number) => (v - c) / 6 / diff + 1 / 2;
    const percentRoundFn = (num: number) => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else if (babs === v) {
            h = (2 / 3) + gg - rr;
        } else {
            h = 0;
        }
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }
    return [
        Math.round(h * 360),
        percentRoundFn(s * 100),
        percentRoundFn(v * 100)
    ];
}

function distance(c1: Color, c2: Color) {
    return Math.sqrt((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2);
}

function hsvDistance(c1: Color, c2: Color) {

    const [h1, s1, v1] = rgb2hsv(c1);
    const [h2, s2, v2] = rgb2hsv(c2);
    // const rhos = c1[1] ** 2 + c2[1] ** 2;
    // const angles = -2 * c1[1] * c2[1] * (Math.cos(c1[0]/(Math.PI*2)) * Math.cos(c2[0]/(Math.PI*2)) + Math.sin(c1[0]/(Math.PI*2)) * Math.sin(c2[0]/(Math.PI*2)));
    // const rs = (c1[2] - c1[2]) ** 2;
    // return Math.sqrt(rhos + angles + rs);
    return Math.sqrt((Math.sin(h1 * Math.PI / (180) / 2) - Math.sin(h2 * Math.PI / (180) / 2)) ** 2 + (s1 - s2) ** 2 + (v1 - v2) ** 2);
}

function labDistance(c1: Color, c2: Color) {
    return chroma.distance(chroma.rgb(c1[0], c1[1], c1[2]), chroma.rgb(c2[0], c2[1], c2[2]));
}

function kmeans(array: Color[]) {

    const numClusters = 12;
    const iterations = 1000;

    const recons: Color[] = imagePreproc(array);

    const reconsLength = recons.length;

    const clusters: Color[] = [];
    const oldClusters = [];
    const clusterDiff = [];
    const clusterMap: number[] = [];

    // const clusterDistances: number[] = [];

    // let worstDistanceScore = Infinity;

    // randomize clusters
    for (let i = 0; i < numClusters; i++) {
        clusters[i] = rngColor();
        oldClusters[i] = [-1, -1, -1];
    }

    // console.log(clusters);
    for (let j = 0; j < iterations; j++) {

        // compute closest cluster
        for (let i = 0; i < reconsLength; i++) {
            const pixel = recons[i];
            const distances = clusters.map(cl => labDistance(pixel, cl));
            const closest = distances.reduce(
                (acc, v, idx) => (v < acc.value) ? { value: v, index: idx } : acc,
                { value: Infinity, index: 0 },
            );
            clusterMap[i] = closest.index;
        }

        // compute new cluster means
        for (let i = 0; i < numClusters; i++) {
            const clusterColors: Color[] = //R.map(R.mean)
                (
                    recons.filter((px, idx) => clusterMap[idx] === i)
                );
            if (clusterColors.length === 0) {
                clusters[i] = rngColor();
                continue;
            }

            const colorMean = [
                Math.round(R.mean((clusterColors).map(v => v[0]))),
                Math.round(R.mean((clusterColors).map(v => v[1]))),
                Math.round(R.mean((clusterColors).map(v => v[2])))
            ];

            clusterDiff[i] = labDistance(oldClusters[i], colorMean);
            oldClusters[i] = clusters[i];
            clusters[i] = colorMean;
        }

        if (Math.max(...clusterDiff) < 1) {
            // console.log('done!');
            break;
        }

        // compute distances between clusters
        // and discard the one with worst score
        // {
        //     for (let x = 0; x < numClusters; x++) {
        //         clusterDistances[x] = clusters
        //             .reduce((acc, v) => acc + labDistance(v, clusters[x]), 0);
        //     }
        //     console.log(clusterDistances, indexOfMinValue(clusterDistances), worstDistanceScore);
        //     const indexOfMin = indexOfMinValue(clusterDistances);
        //     const minValue = clusterDistances[indexOfMin];
        //     if (minValue < worstDistanceScore) {
        //         clusters[indexOfMin] = rngColor();
        //         worstDistanceScore = minValue;
        //     }
        // }


        // if (j % (iterations / 10 >> 0) === 0) {
        //     console.log(clusters);
        // }
    }

    // reorder from most to least used
    // const newOrder = clustersByUsage(clusterMap);

    // const bestClusters = keepBestClusters(clusters, Math.ceil(numClusters / 2));

    let bestClusters = deleteWorstCluster(clusters);
    while (bestClusters.length > Math.ceil(numClusters / 2)) {
        bestClusters = deleteWorstCluster(bestClusters);
    }

    // Sort from darker to lighter
    bestClusters.sort((a, b) => chroma.rgb(a[0], a[1], a[2]).get('lab.l') - chroma(b[0], b[1], b[2]).get('lab.l'));

    // console.log(clusters, clusters.map((v, idx, arr) => arr[newOrder[idx]]))

    // return clusters.map((v, idx, arr) => arr[newOrder[idx]]);
    return bestClusters;
}

function deleteWorstCluster(clusters: number[][]) {
    const numClusters = clusters.length;
    const clusterDistances: number[] = [];

    for (let x = 0; x < numClusters; x++) {
        clusterDistances[x] = clusters
            .reduce((acc, v) => acc + labDistance(v, clusters[x]), 0);
    }

    const indexOfMin = indexOfMinValue(clusterDistances);

    return clusters.slice(0, indexOfMin).concat(clusters.slice(indexOfMin + 1, numClusters + 1));
}

function keepBestClusters(clusters: number[][], numToKeep: number) {

    const numClusters = clusters.length;
    const clusterDistances: number[] = [];

    for (let x = 0; x < numClusters; x++) {
        clusterDistances[x] = clusters
            .reduce((acc, v) => acc + labDistance(v, clusters[x]), 0);
    }

    const ordClusters = R.zip(clusters, clusterDistances);

    ordClusters.sort((a, b) => - a[1] + b[1]);

    // console.log(ordClusters);
    return ordClusters.slice(0, numToKeep).map(c => c[0]);
}