import { AtomsVideo, AtomsVideoContainer } from '../atoms';
import React, { forwardRef,useEffect,useState } from 'react';
import {useCalculateVoiceVolume} from "../../hooks";

export const MoleculesLocalVideo = forwardRef((props, ref) => {
    useCalculateVoiceVolume(ref?.current?.srcObject, 'local')

    return (
        <AtomsVideoContainer>
            <div style={{position: "absolute", width: "100%", display: 'flex', justifyContent: "center"}}>
                <canvas id="canvas-local"  className="visualizer" width="100" height="50" />
            </div>
            <AtomsVideo {...props} ref={ref} />
        </AtomsVideoContainer>
    );
});

export const MoleculesRemoteVideo = (props) => {
    const [mediaStream, setMediaStream] = useState()

    useCalculateVoiceVolume(mediaStream, props.id)

    useEffect(()=> {
        const interval = setInterval(()=> {
            const stream = document.getElementById(props.id).srcObject

            if (stream) {
                setMediaStream(stream);
                clearInterval(interval)
            }
        }, 100)

        return ()=>{
            clearInterval(interval)
        }
    }, [props.id])

    return (
        <AtomsVideoContainer>
            <div style={{position: "absolute", width: "100%", display: 'flex', justifyContent: "center"}}>
                <canvas id={`canvas-${props.id}`}  className="visualizer" width="100" height="50" />
            </div>
            <AtomsVideo {...props} />
        </AtomsVideoContainer>
    );
};
