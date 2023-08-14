const vscode = require('vscode');
const path = require('path');

function activate(context) {
    const createDefaultWorkspaceCommand = vscode.commands.registerCommand('WebDesign.create', () => {
        createDefaultWorkspace();
    });

    const removeDefaultWorkspaceCommand = vscode.commands.registerCommand('WebDesign.remove', () => {
        removeDefaultWorkspace();
    });

    context.subscriptions.push(createDefaultWorkspaceCommand);
    context.subscriptions.push(removeDefaultWorkspaceCommand);
}

async function createDefaultWorkspace() {
    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : null;

    if (workspaceFolder) {
        await createFoldersAndFiles(workspaceFolder.uri);
    }
}

async function createFoldersAndFiles(workspaceUri) {
    const fs = vscode.workspace.fs;

    const indexHtmlContent = '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n  <link rel="stylesheet" href="css/index.css">\n  <script src="js/index.js"></script>\n</head>\n<body>\n  <h1>Welcome to My Page</h1>\n  <img src="images/tab-icon.png" alt="Tab Icon">\n</body>\n</html>';
    const indexCssContent = '/* Your CSS styles here */';
    const indexJsContent = 'console.log("Hello from index.js");';

    const cssFolder = workspaceUri.with({ path: `${workspaceUri.path}/css` });
    const jsFolder = workspaceUri.with({ path: `${workspaceUri.path}/js` });
    const imagesFolder = workspaceUri.with({ path: `${workspaceUri.path}/images` });
    const tabiconFolder = workspaceUri.with({ path: `${workspaceUri.path}/tab-icon` });
    const tabIconPath = imagesFolder.with({ path: `${tabiconFolder.path}/tab-icon.png` });

    const foldersToCreate = [cssFolder, jsFolder, imagesFolder, tabiconFolder];

    await Promise.all(foldersToCreate.map(folder => fs.createDirectory(folder)));

    const filesToCreate = [
        { uri: workspaceUri.with({ path: `${workspaceUri.path}/index.html` }), content: indexHtmlContent },
        { uri: cssFolder.with({ path: `${cssFolder.path}/index.css` }), content: indexCssContent },
        { uri: jsFolder.with({ path: `${jsFolder.path}/index.js` }), content: indexJsContent },
        { uri: tabIconPath, content: new Uint8Array(0) } 
    ];

    await Promise.all(filesToCreate.map(file => fs.writeFile(file.uri, file.content, { create: true })));

    vscode.window.showInformationMessage('Default workspace created with files and folders.');
}

async function removeDefaultWorkspace() {
    const workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0] : null;

    if (workspaceFolder) {
        await removeFoldersAndFiles(workspaceFolder.uri);
    }
}

async function removeFoldersAndFiles(workspaceUri) {
    const fs = vscode.workspace.fs;

    // Remove the folders and files
    const foldersToRemove = ['css', 'js', 'images', 'tab-icon'];
    const filesToRemove = ['index.html'];

    const removePromises = foldersToRemove.map(folderName => {
        const folderUri = workspaceUri.with({ path: path.join(workspaceUri.path, folderName) });
        return fs.delete(folderUri, { recursive: true, useTrash: false });
    });

    filesToRemove.forEach(fileName => {
        const fileUri = workspaceUri.with({ path: path.join(workspaceUri.path, fileName) });
        removePromises.push(fs.delete(fileUri, { useTrash: false }));
    });

    await Promise.all(removePromises);

    vscode.window.showInformationMessage('Default workspace files and folders removed.');
}

exports.activate = activate;
