# @simplrjs/azure-storage-backup

CLI tool to backup Azure storage account to file system.

## Get started

```sh
npm install @simplrjs/azure-storage-backup -g
```

## Features

- Retrieves statistics of your Azure storage account.
- Downloads blobs from Azure storage account.
- Checks for missing files in your file system after download.
- Allows you to define a count of downloads performed concurrently.
- Allows you to define a count of failed download retries.

## Command line

### Usage

```sh
azure-storage-backup -h
```

### Commands

| Command | Description                                                                 |
|---------|-----------------------------------------------------------------------------|
| init    | Generates a configuration file.                                             |
| stats   | Provides a statistics about blobs in Azure Storage account containers.      |
| check   | Checks if all blobs from Azure Storage were downloaded to your file system. |
| sync    | Downloads all blobs that are missing in your file system.                   |

### Arguments

| Argument  | Type    | Default          | Description                                                                      |
|-----------|---------|------------------|----------------------------------------------------------------------------------|
| config    | string  | `process.cwd();` | Config file path.                                                                |
| container | string  | -                | Performs an action on a specific container instead of all Azure storage account. |
| noCache   | boolean | `false`          | Prevents using cached values from previously performed actions.                  |

### Config

You can generate configuration using CLI command `init`:

```sh
azure-storage-backup init
```

It will also add a JSON schema to your generated configuration JSON.

Default configuration file name is `backup.config.json`.

| Property                      | Type      | Default                           | Description                                                                                   |
|-------------------------------|-----------|-----------------------------------|-----------------------------------------------------------------------------------------------|
| storageAccount<sup>(*)</sup>  | `string`  | -                                 | Name of your Azure storage account.                                                           |
| storageAccessKey<sup>(*)</sup>| `string`  | -                                 | A key to access your Azure storage account.                                                   |
| storageHost                   | `string`  | -                                 | Azure storage account host.                                                                   |
| outDir                        | `string`  | `process.cwd();`                  | An output directory for downloaded blobs from your storage account.                           |
| maxRetriesCount               | `number`  | `3`                               | Max retries count for failed operations (container blobs list fetching or blobs downloading). |
| logPath                       | `string`  | `process.cwd();`<sup>(1)</sup>    | Path to log file.                                                                             |
| simultaneousDownloadsCount    | `number`  | `5`                               | Count of concurrently performed blob downloads.                                               |
| noLogFile                     | `boolean` | `false`                           | Prevents to logging CLI activities to a log file.                                             |

`(*)` - Required properties.

`(1)` - Default log file name is `.backup-log`.
