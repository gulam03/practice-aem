![Build Status](https://github.com/pfizer/pfizer-skel-adobe/actions/workflows/testing.yml/badge.svg)

# pfizer-skel-adobe

## Introduction
This is a skeleton structure for Pfizer Edison Adobe sites.

## Installation
First you need to [install composer](https://getcomposer.org/doc/00-intro.md#installation-linux-unix-osx).

> Note: The instructions below refer to the [global composer installation](https://getcomposer.org/doc/00-intro.md#globally).
You might need to replace `composer` with `php composer.phar` (or similar)
for your setup.

## Usage
To create a new Edison Adobe site project, run the Composer command below, replacing `{{SITE_NAME}}` by the name of the site:

```
composer create-project --repository-url="https://repo.packagist.com/pfizer/" --stability dev pfizer/pfizer-skel-adobe:~1 /path/ednlt-{{SITE_NAME}}
```

This command will clone and hydrate this skeleton repository. In the end of the process you will have a new Edison Lite site project.

## Hydration Process

### Placeholder Replacement
This project uses [composer-hydration](https://packagist.org/packages/jkribeiro/composer-hydration) Composer script to perform placeholder replacements, searching in __file contents__, __file names__ and __folders__ for `{{SITE_NAME}}` and replacing by the folder name used to create the project, without the `ednlt-` prefix, e.g. `/path/ednlt-{{SITE_NAME}}`, in this case `{{SITE_NAME}}` will be replaced by the value used on `{{SITE_NAME}}`.

### Distribution files
During the hydration process, the distribution files (\*.dist) will be renamed to remove the `.dist` extension from the name.
- `README.md.dist`: The default README.md of the site.
- `.github/workflows/testing.yml.dist`: The Github Action configuration file of the site.

### Hydration Steps
Composer fires [some events](https://getcomposer.org/doc/articles/scripts.md#event-names) during its execution process. This project uses the event `post-create-project-cmd` triggered after the execution of the command `composer create-project`, performing the hydration process.
You can check the complete hydration steps on `composer.json`, on the `scripts` section.
