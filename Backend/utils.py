"""
This file contains utility and helper functions that can be used
across the application, such as the stream merger.
"""
import asyncio

async def merge_streams(*generators):
    """
    Merge multiple async generators, yielding from whichever is ready first.
    Propagates exceptions to trigger fallback logic if needed.
    
    Yields: (chunk, section_name, generator_index) tuples
    """
    tasks = {}
    
    # Create tasks for all generators
    for idx, gen in enumerate(generators):
        task = asyncio.create_task(gen.__anext__())
        tasks[task] = (idx, gen)
    
    while tasks:
        # Wait for the next chunk from ANY generator
        done, pending = await asyncio.wait(tasks.keys(), return_when=asyncio.FIRST_COMPLETED)
        
        for task in done:
            idx, gen = tasks.pop(task)
            
            try:
                # The analysis functions yield tuples like (chunk, section_name)
                chunk, section = task.result()
                yield (chunk, section, idx)
                
                # Create a new task to continue reading from this generator
                new_task = asyncio.create_task(gen.__anext__())
                tasks[new_task] = (idx, gen)
                
            except StopAsyncIteration:
                # This generator has finished
                continue
            except Exception as e:
                # Re-raise the exception to be handled by the caller
                raise Exception(f"Error in stream {idx}: {str(e)}")
