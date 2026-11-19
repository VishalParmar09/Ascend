package com.ascend.hunter.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class AntiCheatException extends RuntimeException{
    public AntiCheatException(String message){
        super("SYSTEM ANOMALY DETECTED // "+message);
    }
    
}
