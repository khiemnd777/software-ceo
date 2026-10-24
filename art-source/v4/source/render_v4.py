"""True GLB geometry orthographic rendering with VTK, transparent RGBA for sprites."""
from pathlib import Path
import vtk, sys
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
MODEL=ROOT/'models';OUT=ROOT/'renders';SPR=ROOT/'sprites';OUT.mkdir(exist_ok=True);SPR.mkdir(exist_ok=True)

def render(name,path,size=(1000,1000),camera=(4,-5,3.5),target=(0,0,.90),scale=1.35,alpha=True):
 win=vtk.vtkRenderWindow();win.SetOffScreenRendering(True);win.SetAlphaBitPlanes(1);win.SetMultiSamples(8);win.SetSize(*size)
 ren=vtk.vtkRenderer();win.AddRenderer(ren)
 imp=vtk.vtkGLTFImporter();imp.SetFileName(str(MODEL/(name+'.glb')));imp.SetRenderWindow(win);imp.Update()
 cam=ren.GetActiveCamera();cam.SetPosition(*camera);cam.SetFocalPoint(*target);cam.SetViewUp(0,0,1);cam.ParallelProjectionOn();cam.SetParallelScale(scale);cam.SetClippingRange(.01,500)
 if alpha:
  ren.SetBackground(0,0,0)
  if hasattr(ren,'SetBackgroundAlpha'):ren.SetBackgroundAlpha(0)
 else:
  ren.GradientBackgroundOn();ren.SetBackground(.74,.80,.84);ren.SetBackground2(.98,.97,.95)
 actors=ren.GetActors();actors.InitTraversal()
 for i in range(actors.GetNumberOfItems()):
  a=actors.GetNextActor();p=a.GetProperty();p.SetAmbient(.38);p.SetDiffuse(.72);p.SetSpecular(.12);p.SetSpecularPower(22);p.SetInterpolationToPhong()
  orig=a.GetMapper().GetInput()
  if orig is not None and orig.GetNumberOfPoints()>90:
   normals=vtk.vtkPolyDataNormals();normals.SetInputData(orig);normals.SplittingOff();normals.ComputePointNormalsOn();normals.ComputeCellNormalsOff();normals.AutoOrientNormalsOff();normals.Update();a.GetMapper().SetInputData(normals.GetOutput())
 for loc,intensity in [((6,-7,12),.86),((-5,4,10),.59),((3,8,8),.24)]:
  l=vtk.vtkLight();l.SetLightTypeToSceneLight();l.SetPosition(*loc);l.SetFocalPoint(*target);l.SetIntensity(intensity);ren.AddLight(l)
 win.Render()
 filt=vtk.vtkWindowToImageFilter();filt.SetInput(win);filt.SetInputBufferTypeToRGBA();filt.ReadFrontBufferOff();filt.Update()
 wr=vtk.vtkPNGWriter();wr.SetFileName(str(path));wr.SetInputConnection(filt.GetOutputPort());wr.Write()
 im=Image.open(path).convert('RGBA');print('RENDER',name,path.name,im.size,im.getextrema()[3],actors.GetNumberOfItems(),flush=True)
 del imp,filt,ren,win

if __name__=='__main__':
 for job in sys.argv[1:] or ['hero']:
  if job=='hero':render('07_studio_full',OUT/'01_isometric_hero.png',(1360,1160),(4.8,-6.5,6.2),(0,.15,.80),1.65)
  elif job=='side':render('01_workstation_typing',OUT/'02_ergonomics_side.png',(1100,1000),(7,-.3,2.8),(0,.05,.88),1.32)
  elif job=='front':render('01_workstation_typing',OUT/'03_front_facing.png',(1100,1000),(2,6.5,3.1),(0,0,.97),1.3)
  elif job=='portrait':render('03_developer_typing',OUT/'04_character_closeup.png',(950,1200),(2.1,5,2.3),(0,-.30,1.05),.92)
  elif job=='sprite':
   cameras=[('SW',(4.8,-6.5,6.2)),('SE',(-4.8,-6.5,6.2)),('NW',(4.8,6.5,6.2)),('NE',(-4.8,6.5,6.2))]
   for lab,cam in cameras:
    render('01_workstation_typing',SPR/f'workstation_typing_{lab}.png',(512,512),cam,(0,.06,.95),1.4)
    render('03_developer_typing',SPR/f'developer_typing_{lab}.png',(400,400),cam,(0,-.25,.90),1.07)
   render('04_developer_idle',SPR/'developer_idle_SW.png',(400,400),cameras[0][1],(0,-.25,.90),1.07)
   render('05_developer_thinking',SPR/'developer_thinking_SW.png',(400,400),cameras[0][1],(0,-.25,.90),1.07)
   render('06_desk_only',SPR/'desk_only_SW.png',(512,512),cameras[0][1],(0,.45,.85),1.20)
