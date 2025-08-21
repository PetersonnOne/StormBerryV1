'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface SignLanguagePanelProps {
  isOfflineMode: boolean;
}

interface AnimationClip {
  name: string;
  duration: number;
  tracks: any[];
}

export default function SignLanguagePanel({ isOfflineMode }: SignLanguagePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentText, setCurrentText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationsRef = useRef<AnimationClip[]>([]);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Set up camera
    const camera = new THREE.PerspectiveCamera(
      45,
      canvasRef.current.clientWidth / canvasRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 3);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 5;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Load avatar model
    const loader = new GLTFLoader();
    loader.load(
      '/models/sign-language-avatar.glb',
      (gltf) => {
        modelRef.current = gltf.scene;
        scene.add(gltf.scene);

        // Store animations
        animationsRef.current = gltf.animations;

        // Set up animation mixer
        mixerRef.current = new THREE.AnimationMixer(gltf.scene);

        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        setIsLoading(false);
      }
    );

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (mixerRef.current) {
        mixerRef.current.update(0.016); // Update animations
      }

      if (controlsRef.current) {
        controlsRef.current.update(); // Update controls
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return;

      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, []);

  const translateToSignLanguage = async (text: string) => {
    if (!text.trim() || isOfflineMode) return;

    setIsAnimating(true);
    try {
      // Get sign language animation sequence
      const response = await fetch('/api/accessibility/text-to-signs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to translate text');

      const { signs } = await response.json();

      // Play animation sequence
      for (const sign of signs) {
        const animation = animationsRef.current.find(a => a.name === sign);
        if (animation && mixerRef.current) {
          const action = mixerRef.current.clipAction(animation);
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
          action.reset().play();

          // Wait for animation to complete
          await new Promise(resolve => {
            setTimeout(resolve, animation.duration * 1000);
          });
        }
      }
    } catch (error) {
      console.error('Error translating to sign language:', error);
      alert('Failed to translate text to sign language. Please try again.');
    } finally {
      setIsAnimating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder="Enter text to translate to sign language..."
            className="w-full p-2 border rounded-md"
            rows={3}
            disabled={isOfflineMode}
          />
          <Button
            onClick={() => translateToSignLanguage(currentText)}
            disabled={!currentText.trim() || isAnimating || isOfflineMode}
            className="whitespace-nowrap"
          >
            {isAnimating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Translating...
              </>
            ) : (
              'Translate to Signs'
            )}
          </Button>
        </div>

        {isOfflineMode && (
          <div className="text-yellow-600 dark:text-yellow-400 text-sm">
            Sign language translation is not available in offline mode.
          </div>
        )}

        <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  );
}