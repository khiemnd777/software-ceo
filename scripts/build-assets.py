"""Render real V4-derived geometry into Canvas sprites. No AI image assets.
W0 baseline: common orthographic projection, separate furniture/person geometry.
"""
from pathlib import Path
import os, sys, json, importlib.util
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
# Optional private wheel path for this execution environment; normal pip install works elsewhere.
if Path('/tmp/software-ceo-python').exists():sys.path.insert(0,'/tmp/software-ceo-python')
import trimesh
import vtk
OUT=ROOT/'public/assets'; OUT.mkdir(exist_ok=True)
SRC=ROOT/'art-source/v4/models'
GEN=ROOT/'art-source/generated';GEN.mkdir(exist_ok=True)
SIZE=384;SCALE=1.45;ANCHOR=[192,192+.8*np.cos(np.pi/6)*SIZE/(2*SCALE)]

def render(path, dest):
 win=vtk.vtkRenderWindow();win.SetOffScreenRendering(True);win.SetAlphaBitPlanes(1);win.SetMultiSamples(4);win.SetSize(SIZE,SIZE)
 ren=vtk.vtkRenderer();win.AddRenderer(ren);ren.SetBackground(0,0,0);ren.SetBackgroundAlpha(0)
 imp=vtk.vtkGLTFImporter();imp.SetFileName(str(path));imp.SetRenderWindow(win);imp.Update()
 cam=ren.GetActiveCamera();cam.SetPosition(6,-6,.8+4.898979486);cam.SetFocalPoint(0,0,.8);cam.SetViewUp(0,0,1);cam.ParallelProjectionOn();cam.SetParallelScale(SCALE)
 actors=ren.GetActors();actors.InitTraversal()
 for i in range(actors.GetNumberOfItems()):
  a=actors.GetNextActor();p=a.GetProperty();p.SetAmbient(.36);p.SetDiffuse(.72);p.SetSpecular(.08);p.SetSpecularPower(22);p.SetInterpolationToPhong()
  orig=a.GetMapper().GetInput()
  if orig is not None and orig.GetNumberOfPoints()>90:
   normals=vtk.vtkPolyDataNormals();normals.SetInputData(orig);normals.SplittingOff();normals.ComputePointNormalsOn();normals.Update();a.GetMapper().SetInputData(normals.GetOutput())
 for loc,intensity in [((6,-7,12),.82),((-5,4,10),.55),((3,8,8),.24)]:
  l=vtk.vtkLight();l.SetLightTypeToSceneLight();l.SetPosition(*loc);l.SetFocalPoint(0,0,.8);l.SetIntensity(intensity);ren.AddLight(l)
 win.Render();f=vtk.vtkWindowToImageFilter();f.SetInput(win);f.SetInputBufferTypeToRGBA();f.ReadFrontBufferOff();f.Update()
 w=vtk.vtkPNGWriter();w.SetFileName(str(dest));w.SetInputConnection(f.GetOutputPort());w.Write();win.Finalize()
 print('rendered',dest.name,flush=True)

if __name__=='__main__':
 manifest={'version':1,'projection':{'camera':[6,-6,5.698979486],'target':[0,0,.8],'parallelScale':SCALE,'pixelsPerMeter':SIZE/(2*SCALE),'tileRatio':.5},'sprites':{}}
 for key,model in [('desk','06_desk_only'),('worker','03_developer_typing'),('idle','04_developer_idle'),('thinking','05_developer_thinking')]:
  dest=OUT/(key+'.png');render(SRC/(model+'.glb'),dest)
  im=Image.open(dest);manifest['sprites'][key]={'file':key+'.png','width':SIZE,'height':SIZE,'anchor':ANCHOR,'bbox':im.getbbox(),'frames':1,'durationMs':1000,'source':str((SRC/(model+'.glb')).relative_to(ROOT))}
 (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2))
