# denali-node-orm2

Allows use of [Node-ORM2](https://github.com/dresende/node-orm2) to talk to your relational database.

## Installation

1. Install this package (`denali install denali-node-orm2`)
2. Change your `ormAdapter` key in `/config/environment.js` to `node-orm2`
3. Make sure your models (if any) have their attributes defined with the attributes that this adapter defines.

## Available attributes
In Denali, each ORM defines its own set of model attribute types.  If you are shifting
from a different ORM adapter, you'll want to double-check that your attribute types
all match up here.

- `text`
- `number`
- `boolean`
- `json`
- `data`

Node-ORM2 supports additional types ([visible here](https://github.com/dresende/node-orm2/wiki/Model-Properties#types))
but we haven't yet added those to this adapter.  PRs gladly accepted if you need to add additional types.

## Opinions
Currently, this adapter assumes singular table names and snake-cased attribute names.
For example, for the Denali model defined below:

```
export default class Issue extends Model {

  static createdAt = attr('date'); // maps to the issue, created_at column

}
```

Table names will shift to being pluralized shortly by default but we'd also like
both the table name and column naming approach to be configurable in the future to
support databases already in use.

## Troubleshooting

If you are using the sqlite driver and see a `Connection lost - driver does not support reconnection` error, double-check
the path to your DB.  This message can be thrown if the database is not found ...

## Developing

1. Clone the repo down
2. `npm install`
3. `denali server`
4. Hit [localhost:3000](http://localhost:3000)


## Tests

```sh
$ denali test
```
