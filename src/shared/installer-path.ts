import * as fs from 'fs'
import * as path from 'path'

export function resolveInstallerPath(baseDir: string, scriptRelPath: string): string | null {
  const candidates = [
    path.resolve(baseDir, '../../', scriptRelPath),
  ]

  if (baseDir.includes('app.asar')) {
    candidates.unshift(
      path.resolve(baseDir.replace('app.asar', 'app.asar.unpacked'), '../../', scriptRelPath)
    )
  }

  const resourcesPath = (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath
  if (resourcesPath) {
    candidates.push(
      path.resolve(resourcesPath, 'app.asar.unpacked', scriptRelPath),
      path.resolve(resourcesPath, scriptRelPath)
    )
  }

  return candidates.find(candidate => fs.existsSync(candidate)) ?? null
}
