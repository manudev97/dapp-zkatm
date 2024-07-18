import { groth16 } from 'snarkjs';
import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

const WASM = 'withdraw.wasm'
const ZKEY = 'circuit_final.zkey'

export async function POST(req: Request) {
  const { input } = await req.json() as { input: Record<string, any> }

  try {
    // Lee los archivos wasm y zkey desde el sistema de archivos
    const wasm = await fs.readFile(path.resolve('public', WASM));
    const zkey = await fs.readFile(path.resolve('public', ZKEY));

    // Test de consumo de la api para ver estado de proof
    // const data = new Promise<string>( (resolve) => setTimeout( () => resolve("OK"), 5000 ));
    // return NextResponse.json({ data })
    // Ejecuta snarkjs.groth16.fullProve
    const { proof, publicSignals } = await groth16.fullProve(input, wasm, zkey);
    console.log( { input, proof, publicSignals } )
    return NextResponse.json({ proof, publicSignals })

  } catch (error) {
    console.error('Error running snarkjs.groth16.fullProve:', error);
    return NextResponse.error();
  }
}
