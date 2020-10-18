import * as R from 'ramda';

export const clustersByUsage = R.pipe(
    R.countBy(v => v),
    R.toPairs,
    R.sortBy(v => -v[1]),
    R.map(v => parseInt(v[0]))
);

export const imagePreproc = R.pipe(
    R.filter(v => v[3] > 200),
    R.map(R.slice(0, 3))
);

