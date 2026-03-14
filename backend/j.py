# Remove Body p from this Gadget [20% TODO]
def remove(self, p):
    if self.size < 1:
        return
    
    def removeRec(node, p):
        if node.isLeaf():
            if node.p == p:
                node.p = None
                node.nbodies = 0
                node.updateCOM()
                self.size -= 1
                return True
            else:
                return False
        else:
            #internal node tree
            for child in node.children:
                if child is not None and child.box.isIn(p):
                    found_in = removeRec(child, p)
                    if not found_in:
                        return False
                    break
            else:
                return False
            
            node.nbodies -= 1
            
            # collapse
            if node.nbodies < 2:
                remaining_body = None
                for c_in in node.children:
                    if c_in.nbodies > 0:
                        # The remaining body must be in a leaf child
                        if c_in.isLeaf():
                            remaining_body = c_in.p
                        break
                
                #delete remaining empty children
                node.children = None
                # set leftover c to p
                if remaining_body is not None:
                    node.p = remaining_body
                    node.nbodies = 1
                else:
                    node.p = None
                    node.nbodies = 0
            
            # Update COM after any changes
            node.updateCOM()
            return True
    
    removeRec(self.root, p)



def threeBodyProblem(self,sunA,sunB,sunC,lA,lB,lC): # 15%
    bodies = [sunA, sunB, sunC,self]
    curSimulation = Simulation(bodies) 
    states = curSimulation.run()
    numOfYears = 0.0

    for state in states:
        planet = state[3]
        dA = planet.squareDist(state[0])
        dB = planet.squareDist(state[1])
        dC = planet.squareDist(state[2])

        #avoid divisible by 0
        if dA == 0 or dB == 0 or dC == 0:
            return numOfYears

        luminosity = (lA/dA) + (lB/dB) + (lC/dC)

        if luminosity >= scoeff or luminosity <= fcoeff:
            return numOfYears

        numOfYears += curSimulation.dt

    return 10.01